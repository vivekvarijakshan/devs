sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, mobileLibrary,jsPDF) {
        "use strict";
        var ButtonType = mobileLibrary.ButtonType;
        return Controller.extend("kaizenprocessnsp.workflowuimodule.controller.App", {
            onInit: function () {

                // var script = document.createElement('script');
                // script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                // document.head.appendChild(script);
                // var script = document.createElement('script');
                // script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                // document.head.appendChild(script);

                this.FileDisplayDialog();

                var oComboBox = this.getView().byId("cameraSource");
                oComboBox.setModel(new sap.ui.model.json.JSONModel({
                    cameraSources: [
                        { key: "user", text: "Front Camera" },
                        { key: "environment", text: "Back Camera" }
                    ]
                }), "cameraSources");
                // Set the selected item (e.g., "Front Camera" by default)
                oComboBox.setSelectedKey("user");


                //   $.ajax({
                //     url: "https://se-demo-sdcplatformdbrs-dev-mediademo-srv.cfapps.eu10.hana.ondemand.com/media-server/Media?$filter=id eq 10001",
                //     method: "GET",
                //     async: false,
                //     success: function (result, xhr, data) {
                //         debugger;
                //         alert("success capm");

                //     },
                //     error: function (request, status, error) {
                //         debugger;
                //         alert("Error capm");
                //     },
                // });

            },

            onAfterRendering: async function () {

                var oModel = this.getOwnerComponent().getModel("context");
                oModel.attachRequestCompleted(function () {
                    debugger;
                    console.log(oModel.getData());
                    this.ideaNumber = oModel.getData().IdeaNo;
                    this.onGetExistingMediaData(oModel.getData().IdeaNo);
                }.bind(this));

                debugger;

            },
            onGetExistingMediaData: async function (ideanumber) {
                var data = await new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "https://se-demo-sdcplatformdbrs-dev-mediademo-srv.cfapps.eu10.hana.ondemand.com/media-server/Media?$filter=id eq " + ideanumber + " or id eq " + ideanumber + "1 or id eq " + ideanumber + "2 or id eq " + ideanumber + "3",
                        method: "GET",
                        async: false,
                        success: function (result, xhr, data) {
                            resolve(result);
                        },
                        error: function (request, status, error) {
                            reject(error);
                        }
                    });
                });

            },

            onStartCamera: function (oEvent) {
                var cameraID = oEvent.getSource().data("cameraID");
                document.getElementById("video" + cameraID).style.display = "block";
                document.getElementById("image" + cameraID).style.display = "none";
                var oView = this.getView();
                var oVideo = document.getElementById("video" + cameraID);
                var oComboBox = oView.byId("cameraSource");
                var selectedSource = oComboBox.getSelectedKey();
                console.log("Sselected key", selectedSource);
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices
                        .getUserMedia({ video: { facingMode: selectedSource } })
                        .then(function (stream) {
                            oVideo.srcObject = stream;
                            oVideo.style.transform = "scaleX(-1)";
                        })
                        .catch(function (error) {
                            console.error("Error accessing camera:", error);
                        });
                } else {
                    console.error("getUserMedia is not supported in this browser.");
                }
            },

            onCaptureImage: function (oEvent) {
                var cameraID = oEvent.getSource().data("cameraID");
                var oView = this.getView();
                var oVideo = document.getElementById("video" + cameraID);
                var oCapturedImage = oView.byId("capturedImage" + cameraID);

                if (oVideo && oCapturedImage) {
                    oVideo.pause(); // Pause the video stream
                    // oCapturedImage.style.display = "block"; // Display the captured image
                    //oVideo.addStyleClass("hide");
                    document.getElementById("image" + cameraID).style.display = "block";
                    oCapturedImage.src = this.captureImageFromVideo(oVideo);
                    document.getElementById("image" + cameraID).src = oCapturedImage.src;
                    oVideo.play();
                }

            },

            // Function to capture an image from the video stream
            // Function to capture an image from the video stream
            captureImageFromVideo: function (videoElement) {
                var canvas = document.createElement("canvas");
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                var context = canvas.getContext("2d");

                // Flip the image horizontally
                context.translate(canvas.width, 0);
                context.scale(-1, 1);

                // Draw the video frame onto the canvas
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // Reset the transformation to avoid affecting future drawings
                context.setTransform(1, 0, 0, 1, 0, 0);

                // Return the data URL of the captured image
                return canvas.toDataURL("image/png");
            },
            saveCapturedImageAsPNG: function (imageElement, width, height) {
                var canvas = document.createElement("canvas");
                canvas.width = imageElement.width;
                canvas.height = imageElement.height;
                var context = canvas.getContext("2d");
                context.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);
                var dataURL = canvas.toDataURL("image/png");
                return dataURL || "test";
                // var a = document.createElement("a");
                // a.href = dataURL;
                // a.download = "captured_image.png";
                // a.click();

            },
            onSaveImage: function (id) {
                var oView = this.getView();
                var oCapturedImage = oView.byId("capturedImage" + id);
                if (oCapturedImage) {
                    var imageElement = document.getElementById('image' + id);
                    return this.saveCapturedImageAsPNG(imageElement, 1920, 1080);
                }
            },
            onCancel: function (oEvent) {
                var cameraID = oEvent.getSource().data("cameraID");
                document.getElementById("image" + cameraID).style.display = "none";
                var oView = this.getView();
                var oVideo = oView.byId("video" + cameraID);
                var oImage = document.getElementById("image" + cameraID);
                if (oVideo && oImage) {
                    oVideo.play();
                    oImage.style.display = "none";
                }
                this.onStartCamera();
            },

            onStopCamera: function (oEvent) {
                var cameraID = oEvent.getSource().data("cameraID");
                var oView = this.getView();
                var oCameraPreview = oView.byId("cameraPreview" + cameraID);
                document.getElementById("video" + cameraID).style.display = "none";
                var oVideo = document.getElementById("video" + cameraID);
                if (oVideo.srcObject) {
                    oVideo.srcObject.getTracks().forEach(function (track) {
                        track.stop();
                    });
                }
            },
            onPreviewPDF: function () {
                // this.onGeneratePDF();
                var beforeImage = this.onSaveImage("1");
                var afterImage = this.onSaveImage("2");
                var fishboneImage = this.onSaveImage("3");
                var htmlElement = "<HTML> <HEAD> <TITLE>jsPDF HTML Example with html2canvas for Multiple Pages PDF</TITLE> <style> body { background: rgb(204, 204, 204); } .page { background: white; border: 1.5px solid blue; margin: 0 auto; } .page[size='letter'] { height: 30.94cm; width: 20.17cm; } .page[size='letter'][layout='portrait'] { width: 27.94cm; /*height:20.17cm;*/ } .table { font-family: arial, sans-serif; font-size: smaller; border-collapse: collapse; width: 100%; } .table td, .table th { border: 1.5px solid blue; text-align: left; padding: 4px; } </style> </HEAD> <BODY> <div id='container'><p> <button class='btn' onclick='generatePdf()'>Download PDF</button> </p> <div id='doc-target' class='page' layout='portrait' size='letter'> <div style='width:96%; height:auto; border:1px solid blue;margin:5px auto;'> <div> <h2 style='text-align: right;float:left;width:55%;'> KAIZEN </h2> <img style='float:right;' src='data:image/png;base64,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' /> <div> <table class='table'> <tr> <td>Business</td> <td>Value Added Business</td> <td>SBU-Unit</td> <td>MCD</td> <td>Kaizen NO</td> <td colspan='2'>Random Num</td> <td>Format Num</td> <td colspan='2'>Format</td> </tr> <tr> <td>Department</td> <td></td> <td>Category</td> <td colspan='2'></td> <td>Kaizen Period</td> <td>Start date</td> <td></td> <td>End date</td> <td></td> </tr> <tr> <td>Machine/Area</td> <td colspan='3'></td> <td>Classification</td> <td colspan='2'></td> <td>Kaizen Month</td> <td></td> <td>Late Report</td> </tr> <tr> <td>Kaizen Title</td> <td colspan='9'></td> </tr> <tr> <td>Impact on Problem</td> <td colspan='9'></td> </tr> <tr> <td>Problem Definition</td> <td colspan='9'></td> </tr> <tr> <td>Before Condition</td> <td colspan='4' style='text-align:center;'>Before Picture</td> <td colspan='5' style='text-align:center;'>RCE (C &amp; E Diagram)</td> </tr> <tr> <td>Explain</td> <td colspan='4' style='height:300px;padding:10px;'> <img src='" + beforeImage + "' width='100%' height='300px'> </td> <td colspan='5' style='height:300px;padding:10px;'> <img src='" + afterImage + "' width='100%' height='300px'> </td> </tr> <tr> <td colspan='5' style='height:60px;padding:0;vertical-align: top;'> <table class='table' > <tr> <td>MOC:</td> <td>No</td> <td style='width:140px;'>If Yes,MOC No:</td> <td colspan='3'></td> </tr> </table> <table class='table' > <tr style='height:100px;'> <td colspan='6'>Implementation:</td> </tr> </table> <table class='table' > <tr> <td style='width:160px;'>KPI Impact:KPI Name</td> <td>KPI Name</td> <td>UOM:</td> <td>Number/Month</td> <td>From:</td> <td style='width:100px;'></td> </tr> <tr> <td colspan='4'>Results:</td> <td>To:</td> <td style='width:100px;'></td> </tr> <tr> <td>Standardization:</td> <td style='width:140px;'>Cost Savings:</td> <td colspan='4'></td> </tr> </table> <table class='table' > <tr> <td>Document Name</td> <td style='width:100px;'></td> <td>Write Document No.</td> <td>Cost Saving Unit</td> <td style='width:100px;'></td> </tr> <tr> <td>Document Name</td> <td style='width:100px;'></td> <td>Write Document No.</td> <td>HD scope</td> <td style='width:100px;'></td> </tr> <tr> <td>Document Name</td> <td style='width:100px;'></td> <td>Write Document No.</td> <td>HD Area</td> <td style='width:100px;'></td> </tr> </table> </td> <td colspan='5' style='height:320px;vertical-align: top;text-align:center;'> <p style='width:100%;height:20px; border-bottom:1px solid blue;'>After picture</p> <img src='" + fishboneImage + "' width='100%' height='300px'> </td> </tr> </table> <table class='table' style='float: left;width:50%;'> <tr> <td></td> <td>Name</td> <td>Emp ID</td> <td>Role</td> <td>Signature</td> </tr> <tr> <td>Prepared By:</td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td>Reviewed By:</td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td>Approver:</td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td>BE Reviewer:</td> <td></td> <td></td> <td></td> <td></td> </tr> </table> <table class='table' style='float: left;width:50%;'> <tr> <td>Idea Giver Details</td> <td>Company</td> <td>Name</td> <td>Emp ID</td> </tr> <tr style='height:24px;'> <td rowspan='4'></td> <td></td> <td></td> <td></td> </tr> <tr style='height:24px;'> <td></td> <td></td> <td></td> </tr> <tr style='height:24px;'> <td></td> <td></td> <td></td> </tr> <tr style='height:24px;'> <td></td> <td></td> <td></td> </tr> </table> </div> </div> </div><script src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'></script> <script src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'></script> <script> window.jsPDF = window.jspdf.jsPDF; function generatePdf() { var jsPdf = new jsPDF('l', 'pt', 'letter'); var htmlElement = document.getElementById('doc-target'); var opt = { callback: function (jsPdf) { jsPdf.save('Kaizen.pdf'); base64String = jsPdf.output('datauristring'); console.log(base64String); }.bind(this), margin: [0, 0, 0, 0], autoPaging: 'text', html2canvas: { allowTaint: true, dpi: 300, letterRendering: true, logging: false, scale: .75 } }; jsPdf.html(htmlElement, opt);} </script> </BODY></HTML>";
                this.FileDisplayDialog();
                var oHTML = this.oFileDisplayDialog.getContent()[0];
                oHTML.setContent(htmlElement);
                this.oFileDisplayDialog.open();
            },
            onGeneratePDF: function () {

                // this.onLoadPage();
                window.jsPDF = window.jspdf.jsPDF;

                var jsPdf = new jsPDF('l', 'pt', 'letter');
                var htmlElement = document.getElementById('doc-target');
                // you need to load html2canvas (and dompurify if you pass a string to html)
                const opt = {
                    callback: function (jsPdf) {
                        jsPdf.save("Kaizen.pdf");
                        base64String = jsPdf.output('datauristring');
                        console.log(base64String);
                    }.bind(this),
                    margin: [0, 0, 0, 0],
                    autoPaging: 'text',
                    html2canvas: {
                        allowTaint: true,
                        dpi: 300,
                        letterRendering: true,
                        logging: false,
                        scale: .75
                    }
                };

                jsPdf.html(htmlElement, opt);
            },
            FileDisplayDialog: function () {
                // if (!this.oFileDisplayDialog) {
                this.oFileDisplayDialog = new sap.m.Dialog({
                    contentWidth: "90%",
                    contentHeight: "90%",
                    verticalScrolling: true,
                    stretchOnPhone: true,
                    type: "Standard",
                    customHeader: new sap.m.Bar({
                        contentMiddle: new sap.m.Title({
                            text: "PDF Preview"
                        }),
                        contentRight: new sap.m.Button({
                            icon: "sap-icon://decline",
                            customData: {
                                key: "DarkButtonColor",
                                value: "Red",
                                writeToDom: true
                            },
                            press: function () {
                                this.oFileDisplayDialog.close();
                            }.bind(this)
                        }).addStyleClass("ColorButton removeFocus")
                    }),
                    content: [new sap.ui.core.HTML({
                        content: ""
                    })],
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: "Confirm & Download",
                        press: function () {
                            this.onGeneratePDF();
                            this.oFileDisplayDialog.close();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            this.oFileDisplayDialog.close();
                        }.bind(this)
                    })
                }).addStyleClass("sapUiSizeCompact");
                this.getView().addDependent(this.oFileDisplayDialog);
                // }

            },
            onUploadMedia: async function (oEvent) {
                var cameraID = oEvent.getSource().data("cameraID");
                var image = this.onSaveImage(cameraID);
                var imageName = { "1": "beforeImage.png", "2": "afterImage.png", "3": "rceImage.png" };
                var recordId = this.ideaNumber + cameraID;
                var update = await this.onCreateMediaRecord(recordId, "image/png", imageName[cameraID]);
                if (update === "Success") {
                    var createStatus = await this.onUploadMediaFile(recordId, image, "image/png");
                    if (createStatus === "Success") {
                        alert("Created");
                    }
                }


            },
            onCreateMediaRecord: async function (id, mediaType, fileName) {
                return new Promise(function (resolve, reject) {
                    var url = "https://se-demo-sdcplatformdbrs-dev-mediademo-srv.cfapps.eu10.hana.ondemand.com/media-server/Media(" + id + ")";
                    $.ajax({
                        type: "PATCH",
                        url: url,
                        data: JSON.stringify({
                            "mediaType": mediaType,
                            "fileName": fileName
                        }),
                        dataType: "json",
                        async: false,
                        contentType: 'application/json; charset=utf-8',
                        success: function (data, textStatus, xhr) {
                            resolve("Success");
                            // alert("success: " + data + " " + JSON.stringify(xhr));
                            // this.onUploadMeidaFile(recordId); //On success I am uploading the file
                        },
                        error: function (e, xhr, textStatus, err, data) {
                            resolve("Error");
                        }
                    });
                });

            },
            onUploadMediaFile(recordId, base64String, mediaType) {
                return new Promise(function (resolve, reject) {
                    var binaryData = atob(base64String.split(',')[1]);
                    // Convert binary data to Uint8Array
                    var uint8Array = new Uint8Array(binaryData.length);
                    for (var i = 0; i < binaryData.length; i++) {
                        uint8Array[i] = binaryData.charCodeAt(i);
                    }
                    var blob = new Blob([uint8Array], {
                        type: mediaType
                    });
                    var url = "https://se-demo-sdcplatformdbrs-dev-mediademo-srv.cfapps.eu10.hana.ondemand.com/media-server/Media(" + recordId + ")/content";
                    $.ajax({
                        type: "PUT",
                        url: url,
                        data: blob,
                        contentType: mediaType,
                        processData: false, // Important: Don't process the data
                        success: function (data, textStatus, xhr) {
                            resolve("Success");
                        },
                        error: function (e, xhr, textStatus, err, data) {
                            resolve("Error");
                        }
                    });

                });
            }
        });
    });

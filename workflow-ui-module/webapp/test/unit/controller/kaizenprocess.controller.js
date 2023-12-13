/*global QUnit*/

sap.ui.define([
	"kaizenprocessnsp/workflow-ui-module/controller/kaizenprocess.controller"
], function (Controller) {
	"use strict";

	QUnit.module("kaizenprocess Controller");

	QUnit.test("I should test the kaizenprocess controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

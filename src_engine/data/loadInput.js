controller.loadInputDevices = util.singleLazyCall(function (err, baton) {
  if (DEBUG) util.log("loading input devices");

  var canvas = cwt.require_non_null(document.getElementById("cwt_canvas"));
  var menuEl = cwt.require_non_null(document.getElementById("cwt_menu"));

  if (controller.features_client.keyboard) controller.setupKeyboardControls(canvas, menuEl);
  if (controller.features_client.gamePad) controller.setupGamePadControls(canvas, menuEl);
  if (controller.features_client.mouse) controller.setupMouseControls(canvas, menuEl);
  if (controller.features_client.touch) controller.setupTouchControls(canvas, menuEl);
});

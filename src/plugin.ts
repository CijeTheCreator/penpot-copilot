penpot.ui.open("Activity Tracker", `?theme=${penpot.theme},`, {
  width: 320,
  height: 445,
});
penpot.ui.onMessage<{ message: string }>(async (message) => {
  if (message.message == "id_request") {
    penpot.ui.sendMessage({
      type: "user_id_response",
      userId: penpot.currentUser.id,
    });
  }
});

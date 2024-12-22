
const Permissions = {
    List: {
        CAN_VIEW_GUEST: "view_guest",
        CAN_VIEW_PATIENT: "view_patient",
        CAN_VIEW_NURSE: "view_nurse",
        CAN_VIEW_DOCTOR: "view_doctor",
        CAN_VIEW_ADMIN: "view_admin",
        CAN_VIEW_CHAT: "view_chat",
    },
    Guest: [
        "view_guest"
    ],
    Patient: [
        "view_guest",
        "view_patient",
        "view_chat",
    ],
    Nurse: [
        "view_guest",
        "view_patient",
        "view_nurse",
    ],
    Doctor: [
        "view_guest",
        "view_patient",
        "view_nurse",
        "view_doctor",
        "view_chat",
    ],
    Moderator: [
        "view_guest",
        "view_patient",
        "view_nurse",
        "view_doctor",
        "view_admin"
    ]

};

export default Permissions;
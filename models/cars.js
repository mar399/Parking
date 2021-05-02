// Create a json scehma
const carSchema = {
  type: "object",
  properties: {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    slotId: {
      type: String,
      required: true,
    },
    liscenceNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
};

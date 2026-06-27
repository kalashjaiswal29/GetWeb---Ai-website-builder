const mongoose = require('mongoose')

const filesSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "file name required"],
    
  },

  content: {
    type: String,
    default: ""
  }

},{_id : false});

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Project must belong to a user"],
    },

    title: {
      type: String,
      required: [true, "Project title required"],
    },

    prompt: {
      type: String,
      required: [true, "Prompt required to continue"],
    },

    files: [filesSchema],

    status: {
      type: String,
      enum: ["generating", "completed", "failed"],
      default: "generating",
    },
  },
  {
    timestamps: true,
  },
);



const projectModel = mongoose.model("projects", projectSchema) ; ;

module.exports = projectModel ;
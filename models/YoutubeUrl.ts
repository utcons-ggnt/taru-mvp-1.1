import mongoose, { Document, Schema } from 'mongoose';

export interface IYoutubeUrl extends Document {
  _id: mongoose.Types.ObjectId;
  Module: Array<{
    [chapterKey: string]: {
      videoTitle: string;
      videoUrl: string;
    };
  }>;
  uniqueid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const YoutubeUrlSchema = new Schema<IYoutubeUrl>({
  Module: [{
    type: Map,
    of: {
      videoTitle: {
        type: String,
        required: true
      },
      videoUrl: {
        type: String,
        required: true
      }
    }
  }],
  uniqueid: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'Youtube_Url'
});

// Create index for uniqueid for faster queries
YoutubeUrlSchema.index({ uniqueid: 1 });

export default mongoose.models.YoutubeUrl || mongoose.model<IYoutubeUrl>('YoutubeUrl', YoutubeUrlSchema);

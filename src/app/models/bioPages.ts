import mongoose, { Schema, Document } from 'mongoose';

export interface IBiopage extends Document {
  userId: string;
  links: {
    shortUrl: string;
    shortId: string;
    label?: string;
  }[];
  slug: string;

  background: {
    base: string; // color o linear-gradient
    image?: {
      url: string;
      blur?: number;
    };
  };

  textColor: string;
  avatarUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const biopageSchema = new Schema<IBiopage>(
  {
    userId: { type: String, required: true },

    links: [
      {
        shortUrl: { type: String, required: true },
        shortId: { type: String, required: true },
        label: { type: String, default: '' },
      },
    ],

    slug: { type: String, unique: true, required: true },

    background: {
      base: {
        type: String,
        default: '#000000', // color o gradient
      },
      image: {
        url: {
          type: String,
          default: '',
        },
        blur: {
          type: Number,
          default: 0,
        },
        positionX: {
          type: Number,
          default: 0,
        },
        positionY: {
          type: Number,
          default: 0,
        },
        zoom: {
          type: Number,
          default: 0,
        },
      },
    },

    textColor: { type: String, default: '#ffffff' },
    avatarUrl: { type: String, default: '' },
    description: {
      type: String,
      default: 'Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.',
    },
  },
  { timestamps: true }
);

// Índice para búsqueda rápida por userId
biopageSchema.index({ userId: 1 });
// Índice único para slug ya está definido en la propiedad

const Biopage = mongoose.models.Biopage || mongoose.model<IBiopage>('Biopage', biopageSchema);

export default Biopage;

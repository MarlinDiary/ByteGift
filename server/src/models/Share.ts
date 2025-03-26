import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
    shareId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: function (v: string) {
                return /^[a-zA-Z0-9-_]+$/.test(v) && v.length >= 3;
            },
            message: '分享ID只能包含字母、数字、下划线和连字符，且至少需要3个字符'
        }
    },
    items: {
        type: [{
            id: String,
            type: {
                type: String,
                enum: ['photo', 'note', 'spotify', 'doodle', 'audio', 'media']
            },
            position: {
                x: Number,
                y: Number
            },
            zIndex: Number,
            rotation: Number,
            data: {
                imageUrl: String,
                dateTaken: String,
                color: {
                    type: String,
                    default: 'yellow'
                },
                content: {
                    type: String,
                    default: ''
                },
                audioUrl: String,
                spotifyUrl: String,
                svgData: String
            }
        }],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
});

// 添加索引
shareSchema.index({ shareId: 1 });
shareSchema.index({ createdAt: 1 });
shareSchema.index({ expiresAt: 1 });

// 添加日志
shareSchema.pre('save', function (next) {
    console.log('Saving share:', {
        shareId: this.shareId,
        itemCount: this.items.length,
        items: this.items.map(item => ({
            type: item.type,
            data: item.data
        })),
        createdAt: this.createdAt,
        expiresAt: this.expiresAt
    });
    next();
});

export const Share = mongoose.model('Share', shareSchema); 
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8)

const boardSchema = mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => nanoId(),
        },
        board: {
            type: [[String]],
            default: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            validate: {
                validator: (board) => board.length === 3 && board.every(row => row.length === 3),
                message: 'Board deve ser uma matriz 3x3'
            }
        },
        currentPlayer: {
            type: String,
            enum: ['X', 'O'],
            default: 'X'
        },
        status: {
            type: String,
            enum: ['playing', 'finished'],
            default: 'playing'
        },
        winner: {
            type: "String",
            enum: ['X', 'O', null],
            default: null
        }
    },
    {
        timestamps: true,
        _id: false
    }
);

export default mongoose.model("Board", boardSchema);
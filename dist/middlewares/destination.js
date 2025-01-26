var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AsyncWrapper from "./ErrorWarrper.js";
import Error from "../util/AppError.js";
import CommentSchema from "../util/commentValidator.js";
export const commentValidator = AsyncWrapper((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = CommentSchema.validate(req.body);
    if (error) {
        return next(new Error(error.details[0].message, 400));
    }
    next();
}));

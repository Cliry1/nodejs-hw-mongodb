import { isValidObjectId } from 'mongoose';
import { HttpError } from 'http-errors';

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    throw HttpError(404, 'Not found');
  }
  next();
};
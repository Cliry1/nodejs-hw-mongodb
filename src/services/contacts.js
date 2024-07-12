import { ContactsCollection } from "../db/contacts.js";

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};
export const getContactsById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({_id: contactId});
  return contact;
};
export const updateContact = async (contactId, payload, options = {}) => {
  const contact  = await ContactsCollection.findOneAndUpdate({_id:contactId}, payload, {new:true, includeResultMetadata:true,...options});
  return {
    contact: contact.value,
  };
};
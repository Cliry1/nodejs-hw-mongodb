import { ContactsCollection } from "../db/contacts.js";
import {calculatePaginationData} from "../utils/calculatePaginationData.js";
import {SORT_ORDER} from "../constants/index.js";


export const getAllContacts = async ({ page = 1, perPage=10, sortOrder=SORT_ORDER.ASC, sortBy="_id",filter={}, userId }) => {
  const limit = perPage;
  const skip = (page-1)*perPage;

  const contactsQuery = ContactsCollection.find({userId});

  if(filter.isFavourite){
    contactsQuery.where("isFavourite").equals(filter.isFavourite);
  }
  if(filter.contactType){
    contactsQuery.where("contactType").equals(filter.contactType);
  }


  const [contactsCount,contacts] = await Promise.all([ContactsCollection.find().merge(contactsQuery).countDocuments(),contactsQuery.skip(skip).limit(limit).sort({[sortBy]:sortOrder}).exec()]);
  const paginationData = calculatePaginationData(contactsCount,page,perPage);
  return {
    data:contacts,
    ...paginationData
  };
};
export const getContactsById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({_id:contactId, userId});
  return contact;
};

export const createContact = async (payload,userId,photoUrl) => {
  const contact = await ContactsCollection.create({...payload, userId, photo:photoUrl});
  return contact;
};

export const deleteContact = async (contactId, userId) => { 
  const contact = await ContactsCollection.findOneAndDelete({_id: contactId, userId});
  return contact;
};
export const updateContact = async (contactId, {userId,...payload}, options = {} ) => {
  console.log(payload);
  console.log(userId);
  const contact  = await ContactsCollection.findOneAndUpdate({_id:contactId, userId }, payload, {new:true, includeResultMetadata:true,...options});

  return {
    contact: contact.value,
  };
};
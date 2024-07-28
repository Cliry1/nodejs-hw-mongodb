const parseIsFavourite = (isFavourite)=>{
  const isString = typeof isFavourite === "string";
  if(!isString) return;
  if(isFavourite !== "true" && isFavourite !=="false") return;
  if(typeof Boolean(isFavourite)==="boolean") return isFavourite;
};
const parseContactType = (contactType)=>{
  const isString = typeof contactType === "string";
  if(!isString)return;
  const isContactType = (contactType)=>["home","work","personal"].includes(contactType);
  if(isContactType(contactType))return contactType;
};


export const parseFilterParams = (query) => {
  const {isFavourite, contactType}= query;
  const parsedIsFavourite = parseIsFavourite(isFavourite);
  const parsedContactType = parseContactType(contactType);

  return{
    isFavourite:parsedIsFavourite,
    contactType:parsedContactType
  };
};
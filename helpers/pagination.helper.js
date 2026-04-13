module.exports =  (objectPagination, query, countCategory) => {
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
  }
  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitItems;

  objectPagination.totalPage = Math.ceil(
    countCategory / objectPagination.limitItems,
  );
  return objectPagination;
};

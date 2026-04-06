const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];
  categories.forEach((item) => {
    if (item.parent_id === parentId) {
      tree.push({
        id: item.id,
        title: item.title,
        children: buildCategoryTree(categories, item.id),
      });
    }
  });
  return tree;
};
module.exports.buildCategoryTree = buildCategoryTree;

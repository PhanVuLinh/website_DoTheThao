const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];
  categories.forEach((item) => {
    if (item.parent_id === parentId) {
      tree.push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        children: buildCategoryTree(categories, item.id),
      });
    }
  });
  return tree;
};
module.exports.buildCategoryTree = buildCategoryTree;

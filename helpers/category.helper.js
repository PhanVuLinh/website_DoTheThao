const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];
  categories.forEach((item) => {
    if (item.parent_id === parentId) {
      tree.push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        thumbnail: item.thumbnail,
        position: item.position,
        status: item.status,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        children: buildCategoryTree(categories, item.id),
      });
    }
  });
  return tree;
};
module.exports.buildCategoryTree = buildCategoryTree;

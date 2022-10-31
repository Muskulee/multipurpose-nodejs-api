//for the tags array
exports.parseData = (req, res, next) => {
    const { tags, featured} = req.body;
    console.log('tags', typeof tags)
    if (tags) req.body.tags = JSON.parse(tags);
    if (featured) req.body.featured = JSON.parse(featured);
    // console.log('typeof tags', typeof tags)
    next();
}

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = (this.queryString.sort).split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    getPagination (page = 1, limit = 10) {
        if(page < 0) {
            page = 1;
        }
        const size = limit ? +limit : 10;
        const offset = page ? (+page -1) * size : 0;
      
        return { size, offset };
    };
}

module.exports = APIFeatures;
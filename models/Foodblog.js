class BlogPost {
    constructor(
        restaurantName,
        location,
        visitDate,
        rating,
        content,
        imageUrl
    ) {
        this.restaurantName = restaurantName;
        this.location = location;
        this.visitDate = visitDate;
        this.rating = rating;
        this.content = content;
        this.imageUrl = imageUrl;

        this.title = `${restaurantName} - ${rating} Stars`;

        // Automatically generate a timestamp and unique ID
        this.datePublished = new Date().toISOString(); // ISO format for readability
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        this.id = `${timestamp}${random.toString().padStart(3, "0")}`;
    }
}

module.exports = { BlogPost };

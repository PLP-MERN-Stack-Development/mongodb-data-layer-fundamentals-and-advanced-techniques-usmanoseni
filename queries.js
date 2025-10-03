const { MongoClient } = require('mongodb')

async function main() {
    //connection URI
    const uri = 'mongodb://localhost:27017';

    //create a new MongoClient
    const client = new MongoClient(uri);

    await client.connect();
    console.log('Connected successfully to MongoDB server');

    //get reference to the database
    const db = client.db('plp_bookstore');

    //get reference to the books collection
    const booksCollection = db.collection('books');

    //print the document in the collection
    const findResult = await booksCollection.find({}).toArray();
    console.log('Found documents:', findResult);   
    
    // Find books published after a certain year
    const booksAfterYear = await booksCollection.find({ published_year: { $gt: 1900 } }).toArray();
    console.log('Books published after 1900:', booksAfterYear);

    // finding a book by a specific autor 
    const autorName = await booksCollection.find({ author: "George Orwell" }).toArray();
    console.log('Books by George Orwell:', autorName);

    // update a book's information
    const UpdatePrice = await booksCollection.updateOne({ title: 'The Alchemist' }, { $set : { price: 12.69 } });
    console.log('Updated The Alchemist price:', UpdatePrice);
    
    // Delete a book by title
    const DeleteBook = await booksCollection.deleteOne({ title: '1984' });
    console.log('Deleted book 1984:', DeleteBook);
    
    // findd book in stock from year 2010
    const findStockbooks = await booksCollection.find({ in_stack: true, published_year: { $gt: 2010 } }).toArray();
    console.log('Books in stock published after 2010:', findStockbooks);
    
    //Use projection to return only the title, author, and price fields in your queries
    const Result = await booksCollection.find({}, { projection: { title: 1, author: 1, price: 1, _id : 0 } }).toArray();
    console.log('Books with only title, author, and price:', Result);

    //  Implement sorting to display books by price (both ascending and descending)
    const SortAsc = await booksCollection.find({}).sort({ price: 1 }).toArray();
    console.log('Books sorted by price (ascending):', SortAsc);
    
    const SortDsc = await booksCollection.find({}).sort({ price: -1 }).toArray();
    console.log('Books sorted by price (descending):', SortDsc);
    
    // Use the `limit` and `skip` methods to implement pagination (5 books per page)
    const pageNumber = 2; // Example: Get the second page
    const pageSize = 4;
    const paginatedBooks = await booksCollection.find({}).skip((pageNumber-1)*pageSize).limit(pageSize).toArray();
    console.log(`Books on page ${pageNumber}:`, paginatedBooks);

    // Create an aggregation pipeline to calculate the average price of books by genre
    const averagePrice = await booksCollection.aggregate([{ $group: { _id: "$genre", averagePrice: { $avg: "$price" } } }]).toArray();
    console.log('Average price of books by genre:', averagePrice);

    // Create an aggregation pipeline to find the author with the most books in the collection
    const topAuthor = await booksCollection.aggregate([
        { $group: { _id: "$author", bookCount: { $sum: 1 } } }, { $sort: { bookCount: -1 } }, { $limit: 1 }
    ]).toArray();
    console.log('Author with the most books:', topAuthor);
    
    // Implement a pipeline that groups books by publication decade and counts them
    const booksByDecade = await booksCollection.aggregate([
        { $group :{ _id: { $concat: [ { $toString: { $multiply: [ { $floor: { $divide: [ "$published_year", 10 ] } }, 10 ] } }, "s" ] }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]).toArray();
    console.log('Books grouped by publication decade:', booksByDecade);

    // Create an index on the `title` field for faster searches
    const indexName = await booksCollection.createIndex({ title: 1 });
    console.log('Created index on title field:', indexName);

    //Create a compound index on `author` and `published_year`
    const compoundIndexName = await booksCollection.createIndex({ author: 1, published_year: -1 });
    console.log('Created compound index on author and published_year:', compoundIndexName);

    //Use the `explain()` method to demonstrate the performance improvement with your indexes
    const withIndexExplain = await booksCollection.find({ author: "Paulo Coelho" }).explain("executionStats");
    console.log("Query plan with index:", JSON.stringify(withIndexExplain.executionStats, null, 2)); 


}

main().catch(console.error);

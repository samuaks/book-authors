const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}


const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by AUTHOR',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: book => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an AUTHOR',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: author => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
           type: BookType,
           description: 'A single book',
           args: {
               id: { type: GraphQLInt }
           },
           resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
           }
        },
        author: {
            type: AuthorType,
            description: 'A single author',
            args: {
                id: { type : GraphQLInt }
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book);
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name,
                }
                authors.push(author);
                return author
            }
        },
        editBook: {
            type: BookType,
            description: 'Edit a book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLString },
                authorId: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id);
                if(args.name) book.name = args.name;
                if(args.authorId) book.authorId = args.authorId;
                return book
            }
        },
        editAuthor: {
            type: AuthorType,
            description: 'Edit an author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const author = authors.find(author => author.id === args.id);
                if(args.name) author.name = args.name;
                return author
            }
        },
        deleteBook: {
            type: BookType,
            description: 'Delete a book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id);
                if (book) books.splice(books.indexOf(book), 1);
                return book
            }
        },
        deleteAuthor: {
            type: AuthorType,
            description: 'Delete an author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const author = authors.find(author => author.id === args.id);
                if (author) authors.splice(authors.indexOf(author), 1);
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', cors(corsOptions) ,graphqlHTTP({
    graphiql: true,
    schema: schema
}))
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    });
import gql from 'graphql-tag';

export const QUERY_ME = gql`
query me($username: String!){
   me(username: $username){
      _id
      username
      email
      bookCount
      savedBooks {
         bookId
         authors
         description
         title
         image
         link
      }
   }
}`;
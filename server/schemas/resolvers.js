const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
   Query: {
      me: async (parent, { username }) => {
         return User.findOne({ username })
            .select('-__v -password')
            .populate('books');
      },
      users: async () => {
         return User.find()
         .select('-__v -password')
         .populate('books');
      }
   },
   Mutation: {
      addUser: async (parent, args) => {
         const user = await User.create(args);
         const token = signToken(user);

         return { token, user };
      },
      login: async (parent, { email, password }) => {
         const user = await User.findOne({ email });

         if (!user) {
            throw new AuthenticationError('Incorrect credentials');
         }

         const correctPw = await user.isCorrectPassword(password);

         if (!correctPw) {
            throw new AuthenticationError('Incorrect credentials');
         }

         const token = signToken(user);
         return { token, user };
      },
      saveBook: async (parent, args, context) => {
         if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
               { _id: context.user._id },
               { $addToSet: { savedBooks: { ...args } } },
               { new: true, runValidators: true }
            )
            .select('-__v -password')
            .populate('books');
            await console.log(updatedUser);
            return updatedUser;
         }

         throw new AuthenticationError('You need to be logged in!');
      },
      removeBook: async (parent, { bookId }, context) => {
         if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
               { _id: context.user._id },
               { $pull: { savedBooks: bookId } },
               { new: true }
            )
            .select('-__v -password')
            .populate('books');
               
            return updatedUser;
         }

         throw new AuthenticationError('You need to be logged in!');
      }
   }
}

module.exports = resolvers;
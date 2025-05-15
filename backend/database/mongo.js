import mongoose from "mongoose";

const Mongo = {
  client: null,

  async connect({ mongoConnectionString, mongoDbName }) {
    if (this.client) {
      console.log("Already connected to database!");
      return this.client;
    }

    try {
      const uri = `${mongoConnectionString}/${mongoDbName}`;
      
      const connection = await mongoose.connect(uri);

      this.client = connection.connection;

      console.log(`Connected to mongo: ${connection.connection.host}`);
      return this.client;
    } catch (error) {
      console.error("Error connecting to mongo", error.message);
      throw error;
    }
  }
};

export default Mongo;

import mongoose from 'mongoose'


/* CharacterSchema will correspond to a collection in your MongoDB database. */
const Whack_A_Mole_Player_Schema = new mongoose.Schema({

  name: {

    type: String,
  },
  score: {

    type: Number,
  },



})

export default mongoose.models.Whack_A_Mole_Player || mongoose.model('Whack_A_Mole_Player', Whack_A_Mole_Player_Schema)

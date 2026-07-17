import User from "../models/user.model.js";

class UserRepository {
    async getAll (){
        return await User.find({activo: true})
    }

    async getById(user_id){
        return await User.findById(user_id)
    }

    async create (nombre, email, password, imagen_url){
        return await User.create({
            nombre, 
            email, 
            password,
            imagen_url: imagen_url
        })
    }

    async getByEmail (email){
        const user_found = await User.findOne({email: email, activo: true})
        return user_found
    }

    async deleteById (user_id){
        await User.findByIdAndDelete(user_id)
    }

    async updateById(user_id, update_data) {
    return await User.findByIdAndUpdate(user_id, update_data, { new: true });
}
}

const userRepository = new UserRepository()

export default userRepository


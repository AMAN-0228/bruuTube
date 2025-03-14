class BaseController {
    constructor(parameters) {
     this.model = parameters.model   
    }

    findOneById(option){
        if (!option.id) throw new Error("id is required");

        return this.model.findById(option.id);
    };

    findAll(option){
        return this.model.find(option);
    };

    updateOneById(option){
        if (!option.id) throw new Error("id is required");
        return this.model.findByIdAndUpdate(option.id, option.update, {new: true});
    };

    deleteOneById(option){
        if (!option.id) throw new Error("id is required");
        return this.model.findByIdAndDelete(option.id);
    };

    // bulkUpdateInC
};

export default BaseController;
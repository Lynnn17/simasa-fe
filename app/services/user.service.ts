const userService = () => {
    const url = "/user";
    const api = useApi();

    async function retrieve(req: any) {
        return api.get(url, {
            params: req
        });
    }

    async function retrieveAll(req: any) {
        return api.get(`${url}/all`, {
            params: req
        });
    }

    async function retrieveById(id: any) {
        return api.get(`${url}/${id}`);
    }

    async function save(req: any) {
        if (req.id) {
            return update(req);
        } else {
            return create(req);
        }
    }

    async function create(req: any) {
        return api.post(url, req);
    }

    async function update(req: any) {
        return api.put(`${url}/${req.id}`, req);
    }

    async function destroy(id: any) {
        return api.delete(`${url}/${id}`);
    }

    async function resetPassword(req: any) {
        return api.put(`${url}/password/reset/${req.id}`, req);
    }

    async function updateActiveStatus(req: any) {
        return api.put(`${url}/active-status/${req.id}`, req);
    }

    return {
        retrieve,
        retrieveAll,
        retrieveById,
        save,
        create,
        update,
        destroy,
        resetPassword,
        updateActiveStatus,
    };
};

export default userService;

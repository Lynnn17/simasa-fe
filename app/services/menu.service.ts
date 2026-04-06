const menuService = () => {
    const url = "/menu";
    const url2 = "/menu-role";
    const api = useApi();

    async function retrieve(req: any) {
        return api.get(url, {
            params: req,
        });
    }

    async function retrieveAll(req: any) {
        return api.get(`${url}/all`, {
            params: req,
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

    /* ========== Endpoint Role Menu ========== */
    async function retrieveRoleMenu(req: any) {
        return api.get(url2, {
            params: req,
        });
    }

    async function retrieveRoleMenuTrx(req: any) {
        return api.get(`${url2}/trx`, {
            params: req,
        });
    }

    async function CreateBulkRoleMenu(req: any) {
        return api.post(`${url2}/bulk`, req);
    }

    return {
        retrieve,
        retrieveAll,
        retrieveById,
        retrieveRoleMenu,
        retrieveRoleMenuTrx,
        save,
        create,
        CreateBulkRoleMenu,
        update,
        destroy,
    };
};

export default menuService;

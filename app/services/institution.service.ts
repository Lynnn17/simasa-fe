const institutionService = () => {
    const url = "/master/institution";
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

    // Import preview - upload file and get validation results
    async function importPreview(file: File, organizationId: number) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('organizationId', String(organizationId));
        return api.post(`${url}/import/preview`, formData);
    }

    // Import save - save validated data
    async function importSave(req: {
        organizationId: number;
        mode: 'upsert' | 'insert';
        data: any[];
    }) {
        return api.post(`${url}/import`, req);
    }

    return {
        retrieve,
        retrieveAll,
        retrieveById,
        save,
        create,
        update,
        destroy,
        importPreview,
        importSave,
    };
};

export default institutionService;

const fileService = () => {
    const url = "/files";
    const api = useApi();

    /**
     * Upload a file to the server
     * @param file The file object to upload
     * @param filePath The directory path on the server (e.g., 'cv', 'profile')
     * @returns The saved file path string
     */
    async function upload(file: File, filePath: string = "uploads"): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filePath", filePath);

        // We use api.post but since it's FormData, $fetch will handle it correctly
        const response: any = await api.post(`${url}/upload`, formData);
        
        // The backend returns the path directly or inside a data property
        // based on common patterns in this project
        return response?.data || response;
    }

    return {
        upload
    };
};

export default fileService;

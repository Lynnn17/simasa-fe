const importTemplateService = () => {
    const api = useApi();

    async function downloadTemplate(domain: string) {
        try {
            const response = await api.get(`/import/template/${domain}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response as any], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `${domain}_import_template.xlsx`;
            a.click();

            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Download template failed:', error);
            return { success: false, error };
        }
    }

    return {
        downloadTemplate,
    };
};

export default importTemplateService;

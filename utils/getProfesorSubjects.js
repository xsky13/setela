export default async function getProfesorSubjects(userId) {
    const supabase = useSupabaseClient();

    const { data: subject } = await supabase.from("subject").select().eq("userId", userId);
    if (subject.length) {
        const { data: subjectTrimesters } = await supabase.from("trimester").select("id, title, yearId").eq("id", subject.trimesterId);
        if (subjectTrimesters?.length) {
            console.log(subjectTrimesters);
            const { data: subjectYear } = await supabase.from("year").select("id, title").eq("id", subjectTrimesters.yearId);
            return { subject, subjectTrimesters, subjectYear };
        }

    }

    return null;
}
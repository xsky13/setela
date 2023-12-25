export default async function getProfesorSubjects(userId) {
    const supabase = useSupabaseClient();

    const { data: subject } = await supabase.from("subject").select().eq("userId", userId).single();
    if (subject) {
        const { data: subjectTrimester } = await supabase.from("trimester").select("id, title, yearId").eq("id", subject.trimesterId).single();
        if (subjectTrimester) {
            console.log(subjectTrimester);
            const { data: subjectYear } = await supabase.from("year").select("id, title").eq("id", subjectTrimester.yearId).single();
            return { subject, subjectTrimester, subjectYear };
        }

    }

    return null;
}
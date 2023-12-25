export default async function createCourses() {
    const supabase = useSupabaseClient();
    const years = [
        { id: 1, title: "Primer año", number: 1 },
        { id: 2, title: "Segundo año", number: 2 },
        { id: 3, title: "Tercer año", number: 3 },
        { id: 4, title: "Cuarto año", number: 4 }
    ];
    const trimesters = [];
    const subjects = [
        // First year
        [
            //First trimester
            ["Introducción General al AT", "Homilética I", "Fuente Biblicas"],
            // second trimester
            ["Hermenéutica Bíblica (DE)", "HOMILETICA II", "Arqueología Bíblica"],
            // third trimester
            ["PENTATEUCO", "Evangelismo Laico I (E. Personal)", "Ciencia Religión"],
        ],

        // Second year
        [
            // first trimester
            [
                "Libros Poéticos",
                "Evangelismo Laico II (E. Público)",
                "Libros históricos del AT ",
            ],
            // second trimester
            [
                "Historia de la Iglesia de la IASD",
                "Culto y Adoración",
                "Profetas I",
            ],
            // third trimester
            [
                "Liderazgo y Administración pastoral I",
                "Profetas II",
                "Ética Cristiana",
            ],
        ],

        // Third year
        [
            // first trimester
            [
                "Introducción General al NT",
                "Liderazgo y Administración Pastoral II",
                "Evangelios Sinópticos-Jn",
            ],
            // second trimester
            ["Epístolas I", "Aconsejamiento Pastoral I", "Epístolas II"],
            // third trimester
            ["Daniel", "Aconsejamiento Pastoral II", "Teología de la Salud"],
        ],

        // Fourth year
        [
            // first trimester
            ["Teología Sistemática I", "Apocalipsis", "Discipulado Cristiano"],
            // second trimester
            [
                "Teología Sistemática II",
                "Orientación Profética",
                "Plantación de Iglesias I",
            ],
            // third trimester
            [
                "Teología del Santuario",
                "Corrientes Teológicas Contemporáneas",
                "Teología del Santuario II",
            ],
        ],
    ];

    for (const year of years) {
        // Create all the years
        await supabase.from("year").insert(year);
        // Create all the trimesters
        const trimester1 = await supabase.from("trimester").insert({ title: "Primer trimestre", number: 1, yearId: year.id, yearNumber: year.number }).select();
        const trimester2 = await supabase.from("trimester").insert({ title: "Segundo trimestre", number: 2, yearId: year.id, yearNumber: year.number }).select();
        const trimester3 = await supabase.from("trimester").insert({ title: "Tercer trimestre", number: 3, yearId: year.id, yearNumber: year.number }).select();

        trimesters.push(trimester1, trimester2, trimester3);
    }
    
    // console.log(trimesters);

    for (const tri of trimesters) {
        const trimester = tri.data[0]
        const group = subjects[trimester.yearNumber - 1][trimester.number - 1]

        for (const subject of group) {
            await supabase.from("subject").insert({ title: subject, period: subject.indexOf(), userId: null, trimesterId: trimester.id })
        }
    }
}
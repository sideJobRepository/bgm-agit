export interface AcademyClass {
    id: number;
    className: string;
    progressType: string;
    year: number;
}

export interface AcademyData {
    id: number;
    curriculumProgressId: number;
    homework: string;
    inputsDate: string;
    classesName: string;
    progress: string;
    subjects: string;
    teacher: string;
    tests: string;
    progressItems: {
        id
            :
            number;
        pages
            :
            string;
        textBook
            :
           string;
        unit
            :
           string;
    }[]
}
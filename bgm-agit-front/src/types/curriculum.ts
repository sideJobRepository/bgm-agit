export interface CurriculumMonth {
    id?: number;
    startMonth: number; // 1~12
    endMonth: number;   // 1~12
    content: string;
}

export interface CurriculumRow {
    id?: number;
    progressType: string;
    months: CurriculumMonth[];
}

export interface CurriculumData {
    id?: number;
    year: number;
    className: string;
    title: string;
    rows: CurriculumRow[];
}

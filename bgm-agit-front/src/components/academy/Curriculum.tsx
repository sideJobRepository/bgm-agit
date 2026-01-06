import HandsontableBase from './HandsontableBase';

type Props = {
    classKey: string;
    onChangeClassKey: (key: string) => void;
};

export default function Curriculum({ classKey, onChangeClassKey }: Props) {
    const headers = [
        '진도구분',
        ...Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    ];


    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
                <select
                    value={classKey}
                    onChange={(e) => onChangeClassKey(e.target.value)}
                >
                    <option value="3g">3학년 G반</option>
                    <option value="3k">3학년 K반</option>
                    <option value="4g1">4학년 G1반</option>
                </select>
            </div>

            <HandsontableBase
                data={[
                    ['수학', '', '', '', '', '', '', '', '', '', '', '', ''],
                    ['영어', '', '', '', '', '', '', '', '', '', '', '', ''],
                ]}
                colHeaders={headers}
                onChange={(data, merges) => {
                    console.log(data, merges);
                }}
            />
        </div>
    );
}

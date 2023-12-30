import axios from 'axios';
import * as cheerio from 'cheerio';
import { Command } from 'commander';
import fs from 'fs';

const BASE_URL = "https://reg.stamford.edu/registrar/";
const URL = BASE_URL + "class_info_1.asp?avs517859457=6&backto=student";
const PAYLOAD = "facultyid=all&acadyear=2023&semester=1&CAMPUSID=&LEVELID=&coursecode=&coursename=&cmd=2";
const HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://reg.stamford.edu",
    "Referer": "https://reg.stamford.edu/registrar/class_info.asp",
};

class CourseScraper {
    private courses: any[] = [];
    private pageCounter = 1;
    private startTime: number = Date.now();

    public async scrapeCourses(outputFilename: string) {
        console.log("Stamford Scraper v1.0.0 starting...");
        let response = await this.getFromReg(URL);
        let $ = cheerio.load(response.data);

        this.scrapePage($);

        while (true) {
            console.log(`Scraping course list page ${this.pageCounter}...`);
            const nextButton = $('a').filter(function () {
                return $(this).text().trim() === "[NEXT]";
            });

            if (!nextButton.length) break;

            console.log("Next page found, scraping...\n");

            const nextPage = await this.getNextPageInCourseList(nextButton.attr('href') || '');
            $ = cheerio.load(nextPage.data);
            this.scrapePage($);
            this.pageCounter++;
        }

        fs.writeFileSync(outputFilename, JSON.stringify(this.courses, null, 4));

        console.log(`\nSuccessfully scraped ${this.courses.length} courses from ${this.pageCounter} pages in ${this.returnMillisecondsElapsed()}ms.`);
        console.log(`Data has been scraped and written to "${outputFilename}" successfully.`);
    }

    private async getFromReg(url: string) {
        return axios.post(url, PAYLOAD, { headers: HEADERS });
    }

    private async getNextPageInCourseList(urlSuffix: string) {
        return axios.get(BASE_URL + urlSuffix);
    }

    private scrapePage($: cheerio.CheerioAPI) {
        const table = $('table').eq(2);
        const rows = table.find('tr').slice(2);

        rows.each((_, row) => {
            const columns = $(row).find('td').slice(1, -1);
            if (columns.length) {
                const data = columns.map((_, col) => $(col).text().replace(/\xa0/g, ' ').trim()).get();
                const course = this.createCourseObject(data, columns.eq(1));
                this.courses.push(course);
            }
        });
    }

    private createCourseObject(data: string[], column: cheerio.Cheerio<any>) {
        const [courseName, preReqs, lecturerNames] = this.parseColumn(column);
        return {
            course_code: data[0],
            course_name: courseName,
            credits: data[2],
            time: data[3],
            group: data[4],
            take: data[5],
            entry: data[6],
            minimum_seat: data[7],
            leftover: data[8],
            status: data[9],
            study_language: data[10],
            course_prerequisites: preReqs,
            course_lecturers: lecturerNames,
        };
    }

    private parseColumn(column: cheerio.Cheerio<any>) {
        const courseName = column.find('font').contents().filter(function () {
            return this.nodeType === 3;
        }).text().trim();

        const preReqsElement = column.find('font[color="#505070"]');
        const preReqs = this.parsePrerequisites(preReqsElement);

        const lecturerNamesElement = column.find('font[color="#407060"]');
        const lecturerNames = this.parseLecturerNames(lecturerNamesElement);

        return [courseName, preReqs, lecturerNames];
    }

    private parsePrerequisites(element: cheerio.Cheerio<any>) {
        const preReqs: string[] = [];
        if (element.length) {
            const preReqsText = element.contents().filter(function () {
                return this.nodeType === 3;
            }).text();
            const preReqsMatch = /\( Pre: (.*)\)/.exec(preReqsText);
            if (preReqsMatch && preReqsMatch[1]) {
                preReqs.push(...preReqsMatch[1].split('and').map(preReq => preReq.trim()));
            }
        }
        return preReqs;
    }

    private parseLecturerNames(element: cheerio.Cheerio<any>) {
        const lecturerNames: string[] = [];

        if (element.length) {
            element.find('li').each((_, li) => {
                // lecturerNames.push($(li).text().trim());

                li.children.forEach(child => {
                    if (child.type === 'text') {
                        const lecturerName = child.data?.trim() || '';

                        if (!lecturerNames.includes(lecturerName)) {
                            lecturerNames.push(lecturerName);
                        }
                    }
                });
            });
        }

        return lecturerNames;
    }

    private returnMillisecondsElapsed() {
        return Date.now() - this.startTime;
    }
}

const program = new Command();
program.requiredOption('-f, --filename <type>', 'Output JSON filename');

program.parse(process.argv);
const options = program.opts();

const scraper = new CourseScraper();
scraper.scrapeCourses(options.filename);

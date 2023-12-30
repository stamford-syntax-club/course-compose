"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
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
    constructor() {
        this.courses = [];
        this.pageCounter = 1;
        this.startTime = Date.now();
    }
    scrapeCourses(outputFilename) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Stamford Scraper v1.0.0 starting...");
            let response = yield this.getFromReg(URL);
            let $ = cheerio.load(response.data);
            this.scrapePage($);
            while (true) {
                console.log(`Scraping course list page ${this.pageCounter}...`);
                const nextButton = $('a').filter(function () {
                    return $(this).text().trim() === "[NEXT]";
                });
                if (!nextButton.length)
                    break;
                console.log("Next page found, scraping...\n");
                const nextPage = yield this.getNextPageInCourseList(nextButton.attr('href') || '');
                $ = cheerio.load(nextPage.data);
                this.scrapePage($);
                this.pageCounter++;
            }
            fs_1.default.writeFileSync(outputFilename, JSON.stringify(this.courses, null, 4));
            console.log(`\nSuccessfully scraped ${this.courses.length} courses from ${this.pageCounter} pages in ${this.returnMillisecondsElapsed()}ms.`);
            console.log(`Data has been scraped and written to "${outputFilename}" successfully.`);
        });
    }
    getFromReg(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.post(url, PAYLOAD, { headers: HEADERS });
        });
    }
    getNextPageInCourseList(urlSuffix) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.get(BASE_URL + urlSuffix);
        });
    }
    scrapePage($) {
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
    createCourseObject(data, column) {
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
    parseColumn(column) {
        const courseName = column.find('font').contents().filter(function () {
            return this.nodeType === 3;
        }).text().trim();
        const preReqsElement = column.find('font[color="#505070"]');
        const preReqs = this.parsePrerequisites(preReqsElement);
        const lecturerNamesElement = column.find('font[color="#407060"]');
        const lecturerNames = this.parseLecturerNames(lecturerNamesElement);
        return [courseName, preReqs, lecturerNames];
    }
    parsePrerequisites(element) {
        const preReqs = [];
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
    parseLecturerNames(element) {
        const lecturerNames = [];
        if (element.length) {
            element.find('li').each((_, li) => {
                // lecturerNames.push($(li).text().trim());
                li.children.forEach(child => {
                    var _a;
                    if (child.type === 'text') {
                        const lecturerName = ((_a = child.data) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                        if (!lecturerNames.includes(lecturerName)) {
                            lecturerNames.push(lecturerName);
                        }
                    }
                });
            });
        }
        return lecturerNames;
    }
    returnMillisecondsElapsed() {
        return Date.now() - this.startTime;
    }
}
const program = new commander_1.Command();
program.requiredOption('-f, --filename <type>', 'Output JSON filename');
program.parse(process.argv);
const options = program.opts();
const scraper = new CourseScraper();
scraper.scrapeCourses(options.filename);

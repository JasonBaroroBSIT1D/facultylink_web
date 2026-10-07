/**
 * FacultyLink frontend records.
 * These structures stand in for system data until the backend is connected.
 * Scores are not stored as official results; scoring.js computes them from rules.js.
 */
window.FL = window.FL || {};

FL.institution = {
  name: "University of Science and Technology of Southern Philippines",
  campus: "Oroquieta City",
  system: "FacultyLink",
  tagline: "Intelligent Document-Validated Faculty Self-Assessment System",
  circular: "DBM–CHED Joint Circular Rank Upgrade and Reclassification"
};

FL.seed = {
  users: [
    {
      id: "USR-ADMIN-001",
      username: "almonte.teresa",
      email: "teresa.almonte@ustp.edu.ph",
      password: "Admin@461",
      role: "administrator",
      name: "Dr. Teresa Q. Almonte",
      title: "Vice President for Academic Affairs",
      office: "Office of the Vice President for Academic Affairs",
      department: "Academic Affairs",
      employeeNo: "USTP-ADM-0142",
      contact: "(088) 531-1110",
      specialization: "Academic administration and faculty evaluation"
    },
    {
      id: "USR-REV-001",
      username: "cruz.elena",
      email: "elena.cruz@ustp.edu.ph",
      password: "Review@461",
      role: "reviewer",
      name: "Prof. Elena V. Cruz",
      title: "Institutional Reviewer",
      office: "Institutional Evaluation Committee",
      department: "College of Information Technology",
      employeeNo: "USTP-REV-2208",
      contact: "(088) 531-2241",
      specialization: "Information systems and instructional materials"
    },
    {
      id: "USR-REV-002",
      username: "bautista.marco",
      email: "marco.bautista@ustp.edu.ph",
      password: "Review@461",
      role: "reviewer",
      name: "Prof. Marco L. Bautista",
      title: "Institutional Reviewer",
      office: "Institutional Evaluation Committee",
      department: "College of Engineering",
      employeeNo: "USTP-REV-2215",
      contact: "(088) 531-2260",
      specialization: "Engineering research and extension"
    }
  ],
  faculty: [
    {
      id: "FAC-001",
      employeeNo: "USTP-FAC-1008",
      name: "Dr. Liza M. Herrera",
      email: "liza.herrera@ustp.edu.ph",
      department: "Department of Information Technology",
      college: "College of Information Technology",
      rank: "Associate Professor III",
      designation: "Faculty",
      employment: "Existing faculty",
      dateHired: "2012-06-04",
      specialization: "Information systems",
      education: "Ph.D. in Information Technology; M.S. in Information Technology",
      contact: "(088) 531-3108",
      reviewerId: "USR-REV-001"
    },
    {
      id: "FAC-002",
      employeeNo: "USTP-FAC-1144",
      name: "Engr. Ramon D. Villanueva",
      email: "ramon.villanueva@ustp.edu.ph",
      department: "Department of Civil Engineering",
      college: "College of Engineering",
      rank: "Assistant Professor II",
      designation: "Faculty",
      employment: "Existing faculty",
      dateHired: "2016-08-01",
      specialization: "Structural engineering",
      education: "M.Eng. in Civil Engineering",
      contact: "(088) 531-3144",
      reviewerId: "USR-REV-002"
    },
    {
      id: "FAC-003",
      employeeNo: "USTP-FAC-1219",
      name: "Prof. Camille S. Ortega",
      email: "camille.ortega@ustp.edu.ph",
      department: "Department of Teacher Education",
      college: "College of Education",
      rank: "Instructor III",
      designation: "Faculty",
      employment: "Existing faculty",
      dateHired: "2019-01-14",
      specialization: "Science education",
      education: "M.A. in Education",
      contact: "(088) 531-3219",
      reviewerId: "USR-REV-001"
    },
    {
      id: "FAC-004",
      employeeNo: "USTP-FAC-1082",
      name: "Dr. Paolo R. Mendoza",
      email: "paolo.mendoza@ustp.edu.ph",
      department: "Department of Applied Science",
      college: "College of Science",
      rank: "Professor I",
      designation: "Faculty",
      employment: "Existing faculty",
      dateHired: "2004-11-08",
      specialization: "Applied chemistry",
      education: "Ph.D. in Chemistry; M.S. in Chemistry",
      contact: "(088) 531-3082",
      reviewerId: "USR-REV-002"
    },
    {
      id: "FAC-005",
      employeeNo: "USTP-FAC-1302",
      name: "Prof. Hannah G. Reyes",
      email: "hannah.reyes@ustp.edu.ph",
      department: "Department of Agricultural Technology",
      college: "College of Agriculture",
      rank: "Assistant Professor I",
      designation: "Faculty",
      employment: "Existing faculty",
      dateHired: "2018-06-18",
      specialization: "Agricultural extension",
      education: "M.S. in Agriculture",
      contact: "(088) 531-3302",
      reviewerId: "USR-REV-001"
    },
    {
      id: "FAC-006",
      employeeNo: "USTP-FAC-1410",
      name: "Prof. Noel P. Dimaculangan",
      email: "noel.dimaculangan@ustp.edu.ph",
      department: "Department of Languages and Literature",
      college: "College of Arts and Sciences",
      rank: "Associate Professor I",
      designation: "Department Head",
      employment: "Existing faculty",
      dateHired: "2011-07-01",
      specialization: "Language and literature",
      education: "M.A. in Language and Literature",
      contact: "(088) 531-3410",
      reviewerId: "USR-REV-002"
    }
  ],
  documents: [
    {
      id: "DOC-2026-001",
      facultyId: "FAC-001",
      name: "Scopus-indexed journal article on campus information systems",
      fileName: "Herrera_Journal_Scopus_2024.pdf",
      fileType: "PDF",
      fileSize: "1.8 MB",
      pages: 14,
      indicatorId: "kra2-a-journal-sole",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-02-12",
      hash: "9f3a1c82e04b7d55",
      status: "approved",
      ratingInput: null,
      contribution: [{ author: "Liza M. Herrera", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.96,
        title: "A Campus Information System for Documented Faculty Evaluation",
        authors: ["Liza M. Herrera"],
        date: "2024-11-20",
        content: "This journal article reports a documented study of an information system used in a state university. The paper is published in a Scopus-indexed technical journal and carries an ISSN. The publication presents the method, results, and references of the study."
      },
      feedback: "The journal record shows the title, author, publication date, and indexing. Required evidence is complete.",
      decidedAt: "2026-02-18T09:40:00"
    },
    {
      id: "DOC-2026-002",
      facultyId: "FAC-001",
      name: "Co-authored instructional module set for information systems",
      fileName: "Herrera_Module_Set_IS.pdf",
      fileType: "PDF",
      fileSize: "4.2 MB",
      pages: 86,
      indicatorId: "kra1-b-module-co",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-02-20",
      hash: "c21e90ab44d31807",
      status: "approved",
      contribution: [
        { author: "Liza M. Herrera", percent: 60, subject: true },
        { author: "Co-author B", percent: 40, subject: false }
      ],
      ocr: {
        status: "completed",
        confidence: 0.93,
        title: "Information Systems Laboratory Module",
        authors: ["Liza M. Herrera", "Co-author B"],
        date: "2025-03-04",
        content: "A complete module set prepared for classroom instruction in an information systems course. The file includes the peer-review sheet, the department approval for use, and the author contribution certification."
      },
      feedback: "Module set, peer review, approval for use, and the contribution certification are attached. Declared share is 60 percent.",
      decidedAt: "2026-02-26T14:05:00"
    },
    {
      id: "DOC-2026-003",
      facultyId: "FAC-001",
      name: "Student evaluation of teaching effectiveness",
      fileName: "Herrera_Student_Evaluation.xlsx",
      fileType: "Spreadsheet",
      fileSize: "240 KB",
      pages: 6,
      indicatorId: "kra1-a-student",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-01-28",
      hash: "77ab10cce9034d21",
      status: "approved",
      ratingInput: 92,
      contribution: [{ author: "Liza M. Herrera", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.91,
        title: "Student Evaluation Rating — Prescribed Template",
        authors: ["Liza M. Herrera"],
        date: "2025-12-15",
        content: "Prescribed student-evaluation template for teaching effectiveness. The overall rating entered for the computation is 92. The instrument covers the classes and courses handled during the evaluation period."
      },
      feedback: "Prescribed template is complete. The overall rating used in the Annex II formula is 92.",
      decidedAt: "2026-02-02T11:12:00"
    },
    {
      id: "DOC-2026-004",
      facultyId: "FAC-002",
      name: "Notarized MOA for a local government partnership",
      fileName: "Villanueva_MOA_LGU.pdf",
      fileType: "PDF",
      fileSize: "2.1 MB",
      pages: 9,
      indicatorId: "kra3-a-linkage",
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-03-04",
      hash: "18de44aa90c1b773",
      status: "pending-review",
      contribution: [{ author: "Ramon D. Villanueva", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.9,
        title: "Memorandum of Agreement on Community Infrastructure Extension",
        authors: ["Ramon D. Villanueva"],
        date: "2025-08-19",
        content: "Notarized memorandum of agreement for an extension partnership with a local government. The file includes the implementation report and the presidential certification that the faculty implemented the partnership."
      },
      feedback: "",
      decidedAt: null
    },
    {
      id: "DOC-2026-005",
      facultyId: "FAC-003",
      name: "Certificate of participation in a local seminar",
      fileName: "Ortega_Seminar_Certificate.pdf",
      fileType: "PDF",
      fileSize: "480 KB",
      pages: 1,
      indicatorId: "kra4-b-part-local",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-03-11",
      hash: "55c0e19ab2874fa0",
      status: "pending-review",
      contribution: [{ author: "Camille S. Ortega", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.88,
        title: "Certificate of Participation — Seminar on Assessment Practice",
        authors: ["Camille S. Ortega"],
        date: "2025-09-26",
        content: "Certificate of participation in a full-day local seminar. The training activity was conducted by a professional organization and participation was authorized by the campus."
      },
      feedback: "",
      decidedAt: null
    },
    {
      id: "DOC-2026-006",
      facultyId: "FAC-003",
      name: "Scanned teaching portfolio page",
      fileName: "Ortega_Scan_Untitled.pdf",
      fileType: "PDF",
      fileSize: "3.4 MB",
      pages: 2,
      indicatorId: null,
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-03-12",
      hash: "e0b91d44c7720aa3",
      status: "invalid",
      contribution: [],
      ocr: {
        status: "completed",
        confidence: 0.42,
        title: "",
        authors: ["Camille S. Ortega"],
        date: "",
        content: "The scan shows a course outline fragment. A document title and a document date were not extracted. The image is blurred on the heading."
      },
      feedback: "",
      decidedAt: null
    },
    {
      id: "DOC-2026-007",
      facultyId: "FAC-005",
      name: "Narrative report of a field activity",
      fileName: "Reyes_Narrative_Report.pdf",
      fileType: "PDF",
      fileSize: "900 KB",
      pages: 4,
      indicatorId: null,
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-03-08",
      hash: "ab771290cd45ee18",
      status: "reviewer-required",
      contribution: [],
      ocr: {
        status: "completed",
        confidence: 0.84,
        title: "Field Activity Narrative",
        authors: ["Hannah G. Reyes"],
        date: "2025-10-02",
        content: "Narrative of a field activity with a partner office. The extracted text names the place and the people who were present."
      },
      feedback: "",
      decidedAt: null
    },
    {
      id: "DOC-2026-008",
      facultyId: "FAC-004",
      name: "Second upload of the Scopus journal article",
      fileName: "Mendoza_Journal_Copy.pdf",
      fileType: "PDF",
      fileSize: "1.8 MB",
      pages: 14,
      indicatorId: "kra2-a-journal-sole",
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-03-01",
      hash: "9f3a1c82e04b7d55",
      duplicateOf: "DOC-2026-001",
      status: "ignored-duplicate",
      contribution: [{ author: "Paolo R. Mendoza", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.95,
        title: "A Campus Information System for Documented Faculty Evaluation",
        authors: ["Liza M. Herrera"],
        date: "2024-11-20",
        content: "The file hash matches DOC-2026-001. The publication text is the same journal article already stored."
      },
      feedback: "Duplicate file hash. The document is ignored and is not added to the KRA total.",
      decidedAt: "2026-03-01T16:20:00"
    },
    {
      id: "DOC-2026-009",
      facultyId: "FAC-004",
      name: "IPOPHL grant of an invention patent",
      fileName: "Mendoza_Patent_Grant.pdf",
      fileType: "PDF",
      fileSize: "1.1 MB",
      pages: 5,
      indicatorId: "kra2-b-patent-g-co",
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-02-08",
      hash: "d4c0981ab33e7701",
      status: "approved",
      contribution: [
        { author: "Paolo R. Mendoza", percent: 70, subject: true },
        { author: "Co-inventor D", percent: 30, subject: false }
      ],
      ocr: {
        status: "completed",
        confidence: 0.97,
        title: "Letters Patent — Process for a Laboratory Adsorbent",
        authors: ["Paolo R. Mendoza", "Co-inventor D"],
        date: "2025-05-30",
        content: "Patent certificate issued by IPOPHL for the grant of an invention patent. The inventor certification declares a 70 percent contribution for Paolo R. Mendoza and 30 percent for the co-inventor."
      },
      feedback: "Grant certificate and inventor certification are on file. Declared contribution is 70 percent of the 80-point grant.",
      decidedAt: "2026-02-14T10:18:00"
    },
    {
      id: "DOC-2026-010",
      facultyId: "FAC-006",
      name: "Supervisor evaluation of teaching effectiveness",
      fileName: "Dimaculangan_Supervisor_Evaluation.pdf",
      fileType: "PDF",
      fileSize: "360 KB",
      pages: 3,
      indicatorId: "kra1-a-supervisor",
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-02-27",
      hash: "61fa09bc2288d014",
      status: "revision",
      ratingInput: 90,
      contribution: [{ author: "Noel P. Dimaculangan", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.86,
        title: "Supervisor’s Evaluation Rating",
        authors: ["Noel P. Dimaculangan"],
        date: "2025-11-28",
        content: "Supervisor evaluation of teaching for the evaluation period. The overall rating on the form is 90. The prescribed template is only partly attached; the department chair’s signature page is missing."
      },
      feedback: "Submit the complete prescribed supervisor-evaluation template, including the signature page of the department chair. The rating cannot be confirmed from the pages currently attached.",
      decidedAt: "2026-03-05T15:42:00"
    },
    {
      id: "DOC-2026-011",
      facultyId: "FAC-005",
      name: "Photograph album of an outreach activity",
      fileName: "Reyes_Photo_Album.pdf",
      fileType: "PDF",
      fileSize: "6.4 MB",
      pages: 8,
      indicatorId: "kra3-b-ext-participant",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-01-22",
      hash: "90ac7712bb46de50",
      status: "rejected",
      contribution: [{ author: "Hannah G. Reyes", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.8,
        title: "Outreach Photographs",
        authors: ["Hannah G. Reyes"],
        date: "2025-04-11",
        content: "Photographs of a community outreach activity. The file does not include the approval to conduct the activity or the extension activity report required for a participant."
      },
      feedback: "Rejected. Annex I requires the approval for the activity and the extension activity report. Photographs alone are not the documentary evidence for this indicator.",
      decidedAt: "2026-01-29T09:05:00"
    },
    {
      id: "DOC-2026-012",
      facultyId: "FAC-002",
      name: "Conference paper awaiting text extraction",
      fileName: "Villanueva_Conference_Paper.pdf",
      fileType: "PDF",
      fileSize: "2.6 MB",
      pages: 8,
      indicatorId: null,
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-03-16",
      hash: "12bb90ee45aa7106",
      status: "pending-review",
      contribution: [],
      ocr: {
        status: "processing",
        confidence: null,
        title: "",
        authors: [],
        date: "",
        content: ""
      },
      feedback: "",
      decidedAt: null
    },
    {
      id: "DOC-2026-013",
      facultyId: "FAC-001",
      name: "International citation of a published article",
      fileName: "Herrera_Citation_Index.pdf",
      fileType: "PDF",
      fileSize: "520 KB",
      pages: 2,
      indicatorId: "kra2-a-cite-intl",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-02-21",
      hash: "c9e01455ab782210",
      status: "approved",
      contribution: [{ author: "Liza M. Herrera", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.92,
        title: "Citation record — Scopus citing article",
        authors: ["Liza M. Herrera"],
        date: "2025-07-08",
        content: "Citation-index record showing that a publication of the faculty was cited by an article in a Scopus-listed journal. The citing article was published within the evaluation period."
      },
      feedback: "Citation-index evidence identifies the citing article, the index, and the publication date.",
      decidedAt: "2026-02-24T08:55:00"
    },
    {
      id: "DOC-2026-014",
      facultyId: "FAC-003",
      name: "Advisership of an undergraduate thesis",
      fileName: "Ortega_Thesis_Advisership.pdf",
      fileType: "PDF",
      fileSize: "1.4 MB",
      pages: 7,
      indicatorId: "kra1-c-adviser-ut",
      reviewerId: "USR-REV-001",
      dateSubmitted: "2026-03-09",
      hash: "44d0aa1988cc3210",
      status: "pending-review",
      contribution: [{ author: "Camille S. Ortega", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.9,
        title: "Appointment as Undergraduate Thesis Adviser",
        authors: ["Camille S. Ortega"],
        date: "2025-06-20",
        content: "Appointment as adviser of an undergraduate thesis in a program with a CHED Certificate of Program Compliance. The approval page shows that the advisee passed the thesis. The document discusses thesis advisership and instruction of the research course."
      },
      feedback: "",
      decidedAt: null
    },
    {
      id: "DOC-2026-015",
      facultyId: "FAC-006",
      name: "Administrative designation as department head",
      fileName: "Dimaculangan_Designation.pdf",
      fileType: "PDF",
      fileSize: "640 KB",
      pages: 4,
      indicatorId: "kra3-d-dept",
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-01-15",
      hash: "7781c0de9044ab12",
      status: "approved",
      contribution: [{ author: "Noel P. Dimaculangan", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.94,
        title: "Designation as Department Head",
        authors: ["Noel P. Dimaculangan"],
        date: "2024-08-01",
        content: "Notice of designation as department head with an effectivity of more than one year, together with the accomplishment report submitted to the dean. This is an extension of administrative service to the college."
      },
      feedback: "Designation and accomplishment report cover at least one year. Only this designation is credited.",
      decidedAt: "2026-01-20T13:30:00"
    },
    {
      id: "DOC-2026-016",
      facultyId: "FAC-004",
      name: "Client satisfaction summary for an extension project",
      fileName: "Mendoza_Extension_Satisfaction.pdf",
      fileType: "PDF",
      fileSize: "700 KB",
      pages: 3,
      indicatorId: "kra3-c-satisfaction",
      reviewerId: "USR-REV-002",
      dateSubmitted: "2026-02-16",
      hash: "3019aa47bc88d901",
      status: "approved",
      ratingInput: 88,
      contribution: [{ author: "Paolo R. Mendoza", percent: 100, subject: true }],
      ocr: {
        status: "completed",
        confidence: 0.89,
        title: "Client Satisfaction Summary — Outreach Laboratory Activity",
        authors: ["Paolo R. Mendoza"],
        date: "2025-12-02",
        content: "Prescribed summary of client satisfaction ratings for an outreach extension activity. The computed average rating for the period is 88."
      },
      feedback: "The satisfaction summary uses the prescribed template. Average rating 88 is applied to the Criterion C formula.",
      decidedAt: "2026-02-19T16:10:00"
    }
  ],
  notifications: [
    { id: "NTF-001", audience: "administrator", title: "Document approved", body: "DOC-2026-001 for Dr. Liza M. Herrera was marked valid and approved.", at: "2026-02-18T09:40:00", read: false, ref: "DOC-2026-001" },
    { id: "NTF-002", audience: "administrator", title: "Duplicate ignored", body: "DOC-2026-008 matches the file hash of DOC-2026-001 and was ignored.", at: "2026-03-01T16:20:00", read: false, ref: "DOC-2026-008" },
    { id: "NTF-003", audience: "reviewer", userId: "USR-REV-001", title: "Reviewer validation required", body: "DOC-2026-007 for Prof. Hannah G. Reyes could not be classified and is waiting for reviewer validation.", at: "2026-03-08T10:15:00", read: false, ref: "DOC-2026-007" },
    { id: "NTF-004", audience: "reviewer", userId: "USR-REV-001", title: "Missing required fields", body: "DOC-2026-006 for Prof. Camille S. Ortega is invalid because the title and date were not extracted.", at: "2026-03-12T08:05:00", read: false, ref: "DOC-2026-006" },
    { id: "NTF-005", audience: "reviewer", userId: "USR-REV-002", title: "Revision requested", body: "DOC-2026-010 was returned to Prof. Noel P. Dimaculangan. The supervisor-evaluation signature page is missing.", at: "2026-03-05T15:42:00", read: true, ref: "DOC-2026-010" },
    { id: "NTF-006", audience: "administrator", title: "Compliance verification", body: "Prof. Camille S. Ortega has an invalid document and two documents still in the review queue.", at: "2026-03-12T08:06:00", read: false, ref: "FAC-003" },
    { id: "NTF-007", audience: "all", title: "System update", body: "FacultyLink is using DBM–CHED Joint Circular No. 3, s. 2022 (NBC 461, 9th Cycle) as the evaluation-rule source.", at: "2026-03-01T08:00:00", read: true, ref: "KRA" },
    { id: "NTF-008", audience: "reviewer", userId: "USR-REV-002", title: "Document in queue", body: "DOC-2026-004, a notarized partnership MOA, is waiting for review.", at: "2026-03-04T11:24:00", read: false, ref: "DOC-2026-004" },
    { id: "NTF-009", audience: "reviewer", userId: "USR-REV-001", title: "Document in queue", body: "DOC-2026-014, undergraduate thesis advisership, is waiting for review.", at: "2026-03-09T09:18:00", read: false, ref: "DOC-2026-014" },
    { id: "NTF-010", audience: "administrator", title: "Reviewer feedback recorded", body: "Prof. Elena V. Cruz rejected DOC-2026-011 because the extension approval and activity report were not attached.", at: "2026-01-29T09:05:00", read: true, ref: "DOC-2026-011" }
  ],
  audit: [
    { id: "AUD-001", at: "2026-02-18T09:40:00", user: "Prof. Elena V. Cruz", role: "Reviewer", action: "Approved document", ref: "DOC-2026-001", description: "Marked the Scopus journal article valid and approved." },
    { id: "AUD-002", at: "2026-02-26T14:05:00", user: "Prof. Elena V. Cruz", role: "Reviewer", action: "Approved document", ref: "DOC-2026-002", description: "Approved the co-authored module using the declared 60 percent contribution." },
    { id: "AUD-003", at: "2026-03-01T16:20:00", user: "FacultyLink", role: "System", action: "Ignored duplicate", ref: "DOC-2026-008", description: "File hash matched DOC-2026-001. The duplicate was ignored." },
    { id: "AUD-004", at: "2026-03-05T15:42:00", user: "Prof. Marco L. Bautista", role: "Reviewer", action: "Requested revision", ref: "DOC-2026-010", description: "Returned the supervisor evaluation because the signature page is missing." },
    { id: "AUD-005", at: "2026-01-29T09:05:00", user: "Prof. Elena V. Cruz", role: "Reviewer", action: "Rejected document", ref: "DOC-2026-011", description: "Rejected the photograph album. Required extension evidence was not attached." },
    { id: "AUD-006", at: "2026-03-02T08:12:00", user: "Dr. Teresa Q. Almonte", role: "Administrator", action: "Opened KRA configuration", ref: "NBC-461", description: "Viewed the DBM–CHED Joint Circular evaluation rules." },
    { id: "AUD-007", at: "2026-02-14T10:18:00", user: "Prof. Marco L. Bautista", role: "Reviewer", action: "Approved document", ref: "DOC-2026-009", description: "Approved the patent grant using the declared 70 percent inventor contribution." },
    { id: "AUD-008", at: "2026-03-10T09:00:00", user: "Dr. Teresa Q. Almonte", role: "Administrator", action: "Viewed faculty record", ref: "FAC-003", description: "Opened the faculty record of Prof. Camille S. Ortega." }
  ]
};

FL.clone = function (value) {
  return JSON.parse(JSON.stringify(value));
};

FL.store = {
  key: "facultylink.overlay",
  documents: [],
  faculty: [],
  notifications: [],
  audit: [],
  users: [],

  init: function () {
    const overlay = JSON.parse(sessionStorage.getItem(this.key) || "{}");
    const docOverlay = overlay.documents || {};
    this.documents = FL.seed.documents.map(function (doc) {
      return Object.assign(FL.clone(doc), docOverlay[doc.id] || {});
    });
    const facultyOverlay = overlay.faculty || {};
    this.faculty = FL.seed.faculty.map(function (person) {
      return Object.assign(FL.clone(person), facultyOverlay[person.id] || {});
    });
    const userOverlay = overlay.users || {};
    this.users = FL.seed.users.map(function (user) {
      const extra = Object.assign({}, userOverlay[user.id] || {});
      delete extra.password;
      return Object.assign(FL.clone(user), extra);
    });
    const readMap = overlay.notificationRead || {};
    this.notifications = FL.seed.notifications.map(function (item) {
      const copy = FL.clone(item);
      if (Object.prototype.hasOwnProperty.call(readMap, item.id)) copy.read = readMap[item.id];
      return copy;
    }).concat(overlay.notifications || []);
    this.audit = FL.seed.audit.map(FL.clone).concat(overlay.audit || []);
  },

  persist: function () {
    const documents = {};
    this.documents.forEach(function (doc) {
      const seed = FL.seed.documents.find(function (item) { return item.id === doc.id; });
      if (!seed || JSON.stringify(seed) !== JSON.stringify(doc)) documents[doc.id] = doc;
    });
    const faculty = {};
    this.faculty.forEach(function (person) {
      const seed = FL.seed.faculty.find(function (item) { return item.id === person.id; });
      if (seed && seed.reviewerId !== person.reviewerId) faculty[person.id] = { reviewerId: person.reviewerId };
    });
    const users = {};
    this.users.forEach(function (user) {
      const seed = FL.seed.users.find(function (item) { return item.id === user.id; });
      if (!seed) return;
      const changed = {};
      ["contact", "office", "specialization"].forEach(function (key) {
        if (user[key] !== seed[key]) changed[key] = user[key];
      });
      if (Object.keys(changed).length) users[user.id] = changed;
    });
    const notificationRead = {};
    this.notifications.forEach(function (item) {
      const seed = FL.seed.notifications.find(function (row) { return row.id === item.id; });
      if (seed && seed.read !== item.read) notificationRead[item.id] = item.read;
    });
    const extraNotifications = this.notifications.filter(function (item) {
      return !FL.seed.notifications.some(function (row) { return row.id === item.id; });
    });
    const extraAudit = this.audit.filter(function (item) {
      return !FL.seed.audit.some(function (row) { return row.id === item.id; });
    });
    sessionStorage.setItem(this.key, JSON.stringify({
      documents: documents,
      faculty: faculty,
      users: users,
      notificationRead: notificationRead,
      notifications: extraNotifications,
      audit: extraAudit
    }));
  },

  facultyById: function (id) {
    return this.faculty.find(function (person) { return person.id === id; }) || null;
  },

  userById: function (id) {
    return this.users.find(function (user) { return user.id === id; }) || null;
  },

  documentById: function (id) {
    return this.documents.find(function (doc) { return doc.id === id; }) || null;
  },

  saveDocument: function (doc) {
    this.persist();
  },

  assignReviewer: function (facultyId, reviewerId) {
    const person = this.facultyById(facultyId);
    if (!person) return;
    person.reviewerId = reviewerId;
    this.documents.forEach(function (doc) {
      if (doc.facultyId === facultyId && (doc.status === "pending-review" || doc.status === "reviewer-required" || doc.status === "invalid")) {
        doc.reviewerId = reviewerId;
      }
    });
    this.persist();
  },

  addNotification: function (item) {
    this.notifications.unshift(item);
    this.persist();
  },

  addAudit: function (entry) {
    this.audit.unshift(entry);
    this.persist();
  }
};


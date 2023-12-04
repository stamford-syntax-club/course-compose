package data

type CourseJSONResponse struct {
	ID            int      `json:"id,omitempty"`
	Code          string   `json:"code,omitempty"`
	FullName      string   `json:"fullName,omitempty"`
	Prerequisites []string `json:"prerequisites,omitempty"`
}

type ReviewJSONResponse struct {
	ID           int                `json:"id"`
	AcademicYear int                `json:"academicYear"`
	Description  string             `json:"description"`
	IsOwner      bool               `json:"isOwner"`
	Rating       int                `json:"rating"`
	Votes        int                `json:"votes"`
	Course       CourseJSONResponse `json:"course"`
}

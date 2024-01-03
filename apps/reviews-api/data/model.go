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
	IsOwner      bool               `json:"isOwner,omitempty"`
	Rating       int                `json:"rating"`
	Status       string             `json:"status"`
	Votes        int                `json:"votes"`
	Course       CourseJSONResponse `json:"course"`
	Profile      UserJSONResponse   `json:"profile"`
}

type UserJSONResponse struct {
	ID       string `json:"id"`
	Username string `json:"username,omitempty"`
}

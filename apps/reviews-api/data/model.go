package data

type CourseJSONResponse struct {
	ID            int      `json:"id,omitempty"`
	Code          string   `json:"code,omitempty"`
	FullName      string   `json:"fullName,omitempty"`
	Prerequisites []string `json:"prerequisites,omitempty"`
}

type UserJSONResponse struct {
	ID       int                  `json:"id,omitempty"`
	Username string               `json:"username,omitempty"`
	Email    string               `json:"email,omitempty"`
	Verified bool                 `json:"verified,omitempty"`
	Reviews  []ReviewJSONResponse `json:"reviews,omitempty"`
}

type ReviewJSONResponse struct {
	ID           int                `json:"id"`
	AcademicYear int                `json:"academicYear"`
	Description  string             `json:"description"`
	Rating       int                `json:"rating"`
	Votes        int                `json:"votes"`
	Course       CourseJSONResponse `json:"course"`
	User         UserJSONResponse   `json:"user"`
}

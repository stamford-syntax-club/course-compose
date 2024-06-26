package dto

import "time"

type CourseDTO struct {
	ID            int      `json:"id,omitempty"`
	Code          string   `json:"code,omitempty"`
	FullName      string   `json:"fullName,omitempty"`
	Prerequisites []string `json:"prerequisites,omitempty"`
}

type ReviewDTO struct {
	ID             int       `json:"id"`
	AcademicYear   int       `json:"academicYear"`
	Description    string    `json:"description"`
	IsOwner        bool      `json:"isOwner,omitempty"`
	Term           int       `json:"term,omitempty"`
	Section        int       `json:"section,omitempty"`
	Rating         float64   `json:"rating"`
	Status         string    `json:"status"`
	RejectedReason string    `json:"rejectedReason,omitempty"`
	Votes          int       `json:"votes"`
	Course         CourseDTO `json:"course"`
	Profile        UserDTO   `json:"profile"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at,omitempty"`
	Action         string    `json:"action,omitempty"`
}

type UserDTO struct {
	ID       string `json:"id"`
	Username string `json:"username,omitempty"`
}

type ReviewDecisionDTO struct {
	ID             int    `json:"id"`
	Status         string `json:"status"`
	RejectedReason string `json:"rejectedReason,omitempty"`
}

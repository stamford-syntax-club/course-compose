package dto

import "time"

type CourseDTO struct {
	ID            int      `json:"id,omitempty"`
	Code          string   `json:"code,omitempty"`
	FullName      string   `json:"fullName,omitempty"`
	Prerequisites []string `json:"prerequisites,omitempty"`
}

type ReviewDTO struct {
	ID           int       `json:"id"`
	AcademicYear int       `json:"academicYear"`
	Description  string    `json:"description"`
	IsOwner      bool      `json:"isOwner,omitempty"`
	Rating       float64   `json:"rating"`
	Status       string    `json:"status"`
	Votes        int       `json:"votes"`
	Course       CourseDTO `json:"course"`
	Profile      UserDTO   `json:"profile"`
	CreatedAt    time.Time `json:"created_at"`
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

use std::{error::Error, fmt::Display};

#[derive(Debug, Clone)]
pub enum QuillError {
    PermissionDenied(String),
}

impl Error for QuillError {}

impl Display for QuillError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            QuillError::PermissionDenied(msg) => write!(f, "Permission Denied: {msg}"),
        }
    }
}

CREATE TABLE user_credentials (
    uuid text NOT NULL,
    type text,
    hash text,
    user_uuid uuid,
    verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

CREATE TABLE users (
    uuid uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
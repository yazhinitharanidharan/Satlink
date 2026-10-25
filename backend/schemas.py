
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class SessionCreate(BaseModel):
    window_id: int = Field(gt=0)
    antenna_id: int = Field(gt=0)
    station_id: int = Field(gt=0)
    frequency: int = Field(gt=0)
    scheduled_start: datetime
    scheduled_end: datetime

    @model_validator(mode="after")
    def validate_times(self):
        if self.scheduled_end <= self.scheduled_start:
            raise ValueError(
                "Scheduled end must be after scheduled start"
            )
        return self

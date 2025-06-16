package app.mythiccompanions.MythicCompanions.repository;

import app.mythiccompanions.MythicCompanions.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    /**
     * Custom query to fetch a specified number of random questions from the database,
     * filtered by a specific universe.
     * This uses native SQL because JPQL has poor support for ORDER BY RAND().
     * @param universe The string representation of the Universe enum.
     * @param count The maximum number of questions to return.
     * @return A list of random questions for the given universe.
     */
    @Query(value = "SELECT * FROM quiz_questions WHERE universe = :universe ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findRandomQuestionsByUniverse(@Param("universe") String universe, @Param("count") int count);
}

